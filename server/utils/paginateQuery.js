const paginateQuery = async (Model, filter = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  let query = Model.find(filter).sort(sort).skip(skip).limit(limit);

  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((pop) => { query = query.populate(pop); });
    } else {
      query = query.populate(options.populate);
    }
  }

  if (options.select) {
    query = query.select(options.select);
  }

  const [data, total] = await Promise.all([query.exec(), Model.countDocuments(filter)]);

  return { data, page, limit, total };
};

module.exports = { paginateQuery };
