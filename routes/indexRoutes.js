const express = require("express");
const router = express.Router();

const {
  homepage,
  StudentSignup,
  StudentSignin,
  StudentSignout,
  currentUser,
  Studentsendmail,
  studentforgetlink,
  studentresetPassword,
  studentupdate,
  studentavatar,
  applyjob,
  applyinternship,
  getAllInternships,
  getSingleInternship,
  getAllJobs,
  getSingleJob,
  getMyApplications,
  saveJobInternship,
  getSavedJobsInternships,
  removeSavedItem,
} = require("../controllers/indexController");

const { isAuthenticated } = require("../middlewares/auth");

/* ================= HOME ================= */
router.get("/", homepage);

/* ================= CURRENT USER ================= */
router.get("/student", isAuthenticated, currentUser);

/* ================= AUTH ================= */
router.post("/student/signup", StudentSignup);
router.post("/student/signin", StudentSignin);
router.get("/student/signout", isAuthenticated, StudentSignout);

/* ================= PASSWORD ================= */
router.post("/student/send-mail", Studentsendmail);
router.post("/student/forget-link/:id", studentforgetlink);
router.post(
  "/student/reset-password/:id",
  isAuthenticated,
  studentresetPassword
);

/* ================= PROFILE ================= */
router.post("/student/update/:id", isAuthenticated, studentupdate);
router.post("/student/avatar/:id", isAuthenticated, studentavatar);

/* ================= APPLY ================= */
router.post(
  "/student/apply/internship/:internshipid",
  isAuthenticated,
  applyinternship
);

router.post(
  "/student/apply/job/:jobid",
  isAuthenticated,
  applyjob
);

/* ================= FETCH ================= */
router.get("/internships", isAuthenticated, getAllInternships);
router.get("/internships/:id", isAuthenticated, getSingleInternship);
router.get("/jobs", isAuthenticated, getAllJobs);
router.get("/jobs/:id", isAuthenticated, getSingleJob);

/* ================= APPLICATIONS ================= */
router.post("/myapplications", isAuthenticated, getMyApplications);

/* ================= SAVED ================= */
router.post("/student/save", isAuthenticated, saveJobInternship);
router.get(
  "/student/:studentId/saved",
  isAuthenticated,
  getSavedJobsInternships
);
router.post(
  "/remove/:userId/:itemType/:itemId",
  isAuthenticated,
  removeSavedItem
);

module.exports = router;
