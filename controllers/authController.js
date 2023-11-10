const jwt = require("jsonwebtoken");
const User = require("./../models/userModal");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Create Token
  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if Email, Password exist
  if (!email || !password) {
    return next(new AppError("Email or Password is missing", 400));
  }

  // 2. Check if Email and Password is correct
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password`, 404));
  }
  // 3. Send token if everything is ok
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Check if token is exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logging", 401));
  }

  // 2. Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) return next(new AppError("User is no longer exist", 401));

  // 4. Check if user changed password after the token was issue
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password", 401));
  }
  // Give access to protect routed
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("You dont have permission", 403));

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) return next(new AppError("There is no user with this email", 404));

  // 2. Generate random reset Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot password? submit a patch request with new password to :${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset Token",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Error", 500));
  }

  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = (req, res, next) => {};
