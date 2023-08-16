exports.get404Page = (req, res) => {
  res
    .status(404)
    .render("error/404", { title: "Error (404) - Page Not Found" });
};

exports.get500Page = (err, req, res, next) => {
  res.status(500).render("error/500", {
    title: "Error 500",
    message: "Internal Server Error (500)",
  });
};
