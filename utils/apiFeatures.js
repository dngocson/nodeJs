class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Filtering
  filter() {
    // 1. Basic Filter
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. Advance Filter
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  // 2.Sorting
  sort() {
    if (this.queryString.sort) {
      // Sort multiple: sort('a','b')
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createAt");
    }
    return this;
  }

  // 3. Limiting Fields
  limitFields() {
    if (this.queryString.fields) {
      console.log("Here");
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // 4. Paginate
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIfeatures;
