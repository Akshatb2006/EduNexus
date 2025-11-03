const Submission = require('../models/Submission');
const cloudinary = require('../config/cloudinary');

exports.submitAssignment = async (req, res) => {
  try {
    // ✅ FIX: Get data from req.body properly
    console.log('Full request body:', req.body);
    console.log('Files:', req.files);

    // Extract assignmentId and comments
    const assignmentId = req.body.assignmentId;
    const comments = req.body.comments || '';

    console.log('Parsed data:', { assignmentId, comments });

    // Validation
    if (!assignmentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Assignment ID is required',
        receivedBody: req.body // Debug info
      });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({ 
        success: false,
        message: 'File is required',
        receivedFiles: req.files ? Object.keys(req.files) : 'no files'
      });
    }

    const file = req.files.file;

    console.log('Uploading file to Cloudinary:', file.name);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'edunexus/submissions',
      resource_type: 'auto',
    });

    console.log('Cloudinary upload successful');

    // Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      fileUrl: result.secure_url,
      comments: comments,
    });

    // Populate submission
    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email')
      .populate('assignment', 'title');

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: populatedSubmission
    });

  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback },
      { new: true }
    ).populate('student', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};