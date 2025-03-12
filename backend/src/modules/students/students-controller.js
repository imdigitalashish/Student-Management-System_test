const asyncHandler = require("express-async-handler");
const studentService = require("./students-service");

const { fetchAllClasses, fetchClassDetail, addClass, updateClassDetail, deleteClass } = require("../classes/classes-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
  try {
    const filterableFields = ['class', 'section', 'name', 'roll'];
    

    const all_classses = await fetchAllClasses();

    const cleanFilters = Object.keys(req.query)
      .filter(key => filterableFields.includes(key) && req.query[key].trim() !== '')
      .reduce((acc, field) => {
        if (field === "class") {
          acc["className"] = all_classses.find(c => c.id === parseInt(req.query[field].trim()))?.name || req.query[field].trim();

        }
        return acc;
      }, {});

      console.log(cleanFilters)

    const students = await studentService.getAllStudents(cleanFilters);

    return res.status(200).json({
      success: true,
      students
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve students"
    });
  }
});


const handleAddStudent = asyncHandler(async (req, res) => {
  try {
    const result = await studentService.addNewStudent(req.body);
    
    return res.status(201).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add student"
    });
  }
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
      });
    }
    
    const payload = {
      ...req.body,
      userId: studentId
    };
    
    const result = await studentService.updateStudent(payload);
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update student"
    });
  }
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
  try {
    const isCurrentUser = !req.params.id || req.params.id === 'me';
    const userId = isCurrentUser 
      ? req.user.id 
      : parseInt(req.params.id);
    
    if (!isCurrentUser && (isNaN(userId) || !userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
      });
    }
    
    const studentData = await studentService.getStudentDetail(userId);
    
    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    
    const formattedResponse = {
      id: studentData.id,
      name: studentData.name,
      gender: studentData.gender,
      dob: studentData.dob,
      phone: studentData.phone,
      email: studentData.email,
      class: studentData.class,
      section: studentData.section,
      roll: studentData.roll?.toString(),
      admissionDate: studentData.admissionDate,
      currentAddress: studentData.currentAddress,
      permanentAddress: studentData.permanentAddress,
      fatherName: studentData.fatherName,
      fatherPhone: studentData.fatherPhone || "",
      motherName: studentData.motherName || "",
      motherPhone: studentData.motherPhone || "",
      guardianName: studentData.guardianName,
      guardianPhone: studentData.guardianPhone,
      relationOfGuardian: studentData.relationOfGuardian,
      systemAccess: studentData.systemAccess || false,
      reporterName: studentData.reporterName || "Admin"
    };
    
    return res.status(200).json(formattedResponse);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve student details"
    });
  }
});

const handleStudentStatus = asyncHandler(async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID"
      });
    }
    
    const { status } = req.body;
    
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }
    
    const reviewerId = req.user?.id || null;
    
    const result = await studentService.setStudentStatus({ 
      userId, 
      reviewerId, 
      status 
    });
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update student status"
    });
  }
});

module.exports = {
  handleGetAllStudents,
  handleGetStudentDetail,
  handleAddStudent,
  handleStudentStatus,
  handleUpdateStudent,
};