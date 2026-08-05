// utils/sendtoken.js

exports.sendtoken = (student, statusCode, res) => {
  const token = student.getjwttoken();

  const isProd = process.env.NODE_ENV === "production";

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
  console.log("Generated Token:", token);
console.log("Cookie Options:", options);

 res
  .status(statusCode)
  .cookie("token", token, options)
  .json({
    success: true,
    token,
  });
};

exports.sendtokenemploy = (employe, statusCode, res) => {
  const token = employe.getjwttoken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    id: employe._id,
    token,
  });
};
