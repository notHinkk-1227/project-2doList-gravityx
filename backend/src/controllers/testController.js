const testMessage = (req, res) => {
  res.json({
    message: "Controller Berhasil"
  });
};

module.exports = {
  testMessage
};