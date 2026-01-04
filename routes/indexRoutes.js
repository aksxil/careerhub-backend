const express = require("express");

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

const router = express.Router();

/* ================= HOME ================= */
router.get("/", homepage);

/* ================= CURRENT STUDENT ================= */
router.get("/student", isAuthenticated, currentUser);

/* ================= STUDENT AUTH ================= */
router.post("/student/signup", StudentSignup);
router.post("/student/signin", StudentSignin);
router.get("/student/signout", isAuthenticated, StudentSignout);

/* ================= FORGOT / RESET PASSWORD ================= */
router.post("/student/send-mail", Studentsendmail);
router.post("/student/forget-link/:id", studentforgetlink);
router.post(
  "/student/reset-password/:id",
  isAuthenticated,
  studentresetPassword
);

/* ================= STUDENT PROFILE ================= */
router.post("/student/update/:id", isAuthenticated, studentupdate);
router.post("/student/avatar/:id", isAuthenticated, studentavatar);

/* ================= APPLY INTERNSHIP ================= */
router.post(
  "/student/apply/internship/:internshipid",
  isAuthenticated,
  applyinternship
);

/* ================= APPLY JOB ================= */
router.post(
  "/student/apply/job/:jobid",
  isAuthenticated,
  applyjob
);

/* ================= INTERNSHIPS ================= */
router.get("/internships", isAuthenticated, getAllInternships);
router.get("/internships/:id", isAuthenticated, getSingleInternship);

/* ================= JOBS ================= */
router.get("/jobs", isAuthenticated, getAllJobs);
router.get("/jobs/:id", isAuthenticated, getSingleJob);

/* ================= MY APPLICATIONS ================= */
router.post("/myapplications", isAuthenticated, getMyApplications);

/* ================= SAVED JOBS / INTERNSHIPS ================= */
router.post(
  "/student/save",
  isAuthenticated,
  saveJobInternship
);

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
