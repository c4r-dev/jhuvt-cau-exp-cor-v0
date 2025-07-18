import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

// Define the submission schema
const submissionSchema = new mongoose.Schema({
  tableAnalysis: {
    type: String,
    required: true
  },
  graphAnalysis: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Define the causalExpCorr schema
const causalExpCorrSchema = new mongoose.Schema({
  explanation: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Define the cleanCodeCorrRead schema for userData
const cleanCodeCorrReadSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  startTime: {
    type: Number,
    required: true
  },
  responses: [{
    questionIndex: String,
    questionName: String,
    codeVersion: String,
    subQuestion: Number,
    subQuestionText: String,
    answer: String,
    timeSpent: Number,
    timestamp: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create or get the models
const Submission = mongoose.models.dinstimneg || mongoose.model('dinstimneg', submissionSchema);
const CleanCodeCorrRead = mongoose.models.cleanCodeCorrRead || mongoose.model('cleanCodeCorrRead', cleanCodeCorrReadSchema);
const CausalExpCorr = mongoose.models.causalExpCorr || mongoose.model('causalExpCorr', causalExpCorrSchema);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Check if this is causalExpCorr submission (for chocolate analysis)
    if (body.explanation && !body.sessionId) {
      const causalExpCorrSubmission = new CausalExpCorr({
        explanation: body.explanation
      });
      await causalExpCorrSubmission.save();
      return NextResponse.json({ success: true, id: causalExpCorrSubmission._id, collection: 'causalExpCorr' });
    }
    
    // Check if this is userData submission (for cleanCodeCorrRead)
    if (body.sessionId && body.responses) {
      const cleanCodeSubmission = new CleanCodeCorrRead(body);
      await cleanCodeSubmission.save();
      return NextResponse.json({ success: true, id: cleanCodeSubmission._id, collection: 'cleanCodeCorrRead' });
    }
    
    // Original submission logic for tableAnalysis/graphAnalysis
    const { tableAnalysis, graphAnalysis } = body;
    
    if (!tableAnalysis || !graphAnalysis) {
      return NextResponse.json(
        { error: 'Both tableAnalysis and graphAnalysis are required' },
        { status: 400 }
      );
    }
    
    const submission = new Submission({
      tableAnalysis,
      graphAnalysis
    });
    
    await submission.save();
    
    return NextResponse.json({ success: true, id: submission._id });
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    await dbConnect();
    
    // Get the last 15 submissions from causalExpCorr, sorted by timestamp descending
    const causalExpCorrSubmissions = await CausalExpCorr
      .find({})
      .sort({ timestamp: -1 })
      .limit(15)
      .lean();
    
    return NextResponse.json({ causalExpCorrSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}