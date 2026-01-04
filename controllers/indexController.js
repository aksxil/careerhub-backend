const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Student = require("../models/studentModel");
const Internship = require("../models/internshipModel");
const Job = require("../models/JobModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendtoken } = require("../utils/SendToken");
const { sendmail } = require("../utils/nodemailer");
const imagekit = require("../utils/imagekit").initImageKit();
const path = require("path");
const Employe = require("../models/employeModel");

// ================= HOME =================
exports.homepage = catchAsyncError(async (req, res) => {
  res.json({ message: "Secure home page" });
});

// ================= CURRENT USER =================
exports.currentUser = catchAsyncError(async (req, res, next) => {
  if (!req.id) {
    return next(new ErrorHandler("Unauthorized", 401));
  }
  const student = await Student.findById(req.id).exec();
  res.json({ student });
});

// ================= SIGNUP =================
exports.StudentSignup = catchAsyncError(async (req, res) => {
  const student = await new Student(req.body).save();
  sendtoken(student, 201, res);
});

// ================= SIGNIN =================
exports.StudentSignin = catchAsyncError(async (req, res, next) => {
  const student = await Student.findOne({ email: req.body.email })
    .select("+password")
    .exec();

  if (!student) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const isMatch = await student.comparepassword(req.body.password);
  if (!isMatch) {
    return next(new ErrorHandler("Incorrect email or password", 401));
  }

  // 🔥 IMPORTANT FIX: attach id for auth middleware
  req.id = student._id;

  sendtoken(student, 200, res);
});

// ================= SIGNOUT =================
exports.StudentSignout = catchAsyncError(async (req, res) => {
  res.clearCookie("token");
  req.session?.destroy(() => {});
  res.json({ message: "Successfully signed out" });
});

// ================= SEND FORGOT MAIL =================
exports.Studentsendmail = catchAsyncError(async (req, res, next) => {
  const student = await Student.findOne({ email: req.body.email }).exec();

  if (!student) {
    return next(new ErrorHandler("User not found", 404));
  }

  const frontendURL = process.env.FRONTEND_URL; // ✅ FIX
  const url = `${frontendURL}/student/forget-link/${student._id}`;

  sendmail(req, res, next, url);

  student.resetPasswordToken = "1";
  await student.save();

  res.json({ success: true });
});

// ================= RESET PASSWORD LINK =================
exports.studentforgetlink = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.params.id).exec();

  if (!student || student.resetPasswordToken !== "1") {
    return next(new ErrorHandler("Invalid or expired link", 400));
  }

  student.resetPasswordToken = "0";
  student.password = req.body.password;
  await student.save();

  res.json({ message: "Password successfully changed" });
});

// ================= CHANGE PASSWORD (LOGGED IN) =================
exports.studentresetPassword = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  student.password = req.body.password;
  await student.save();
  sendtoken(student, 200, res);
});

// ================= UPDATE PROFILE =================
exports.studentupdate = catchAsyncError(async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body).exec();
  res.json({ success: true, message: "Student updated successfully" });
});

// ================= AVATAR =================
exports.studentavatar = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  const file = req.files?.avatar;

  if (!file) {
    return next(new ErrorHandler("Avatar file missing", 400));
  }

  const modifiedFileName = `student-${Date.now()}${path.extname(file.name)}`;

  if (student.avatar.fileId) {
    await imagekit.deleteFile(student.avatar.fileId);
  }

  const { fileId, url } = await imagekit.upload({
    file: file.data,
    fileName: modifiedFileName,
  });

  student.avatar = { fileId, url };
  await student.save();

  res.json({ success: true, message: "Avatar updated" });
});

// ================= APPLY INTERNSHIP =================
exports.applyinternship = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.id);
  const internship = await Internship.findById(req.params.internshipid);

  if (!internship) {
    return next(new ErrorHandler("Internship not found", 404));
  }

  if (!student.internships.includes(internship._id)) {
    student.internships.push(internship._id);
    internship.students.push(student._id);
  }

  await student.save();
  await internship.save();

  res.json({ success: true });
});

// ================= APPLY JOB =================
exports.applyjob = catchAsyncError(async (req, res, next) => {
  const student = await Student.findById(req.id);
  const job = await Job.findById(req.params.jobid);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  if (!student.jobs.includes(job._id)) {
    student.jobs.push(job._id);
    job.students.push(student._id);
  }

  await student.save();
  await job.save();

  res.json({ success: true });
});

// ================= GET ALL INTERNSHIPS =================
exports.getAllInternships = catchAsyncError(async (req, res) => {
  const internships = await Internship.find().populate("employe");
  res.json({ success: true, data: internships });
});

// ================= GET SINGLE INTERNSHIP =================
exports.getSingleInternship = catchAsyncError(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id).populate("employe");
  if (!internship) {
    return next(new ErrorHandler("Internship not found", 404));
  }
  res.json({ success: true, data: internship });
});

// ================= GET ALL JOBS =================
exports.getAllJobs = catchAsyncError(async (req, res) => {
  const jobs = await Job.find().populate("employe");
  res.json({ success: true, data: jobs });
});

// ================= GET SINGLE JOB =================
exports.getSingleJob = catchAsyncError(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate("employe");
  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }
  res.json({ success: true, data: job });
});

// ================= MY APPLICATIONS =================
exports.getMyApplications = catchAsyncError(async (req, res) => {
  const student = await Student.findById(req.id)
    .populate({
      path: "jobs",
      populate: { path: "employe", select: "organizationLogo organizationname" },
    })
    .populate("internships");

  res.json({
    jobs: student.jobs,
    internships: student.internships,
  });
});
