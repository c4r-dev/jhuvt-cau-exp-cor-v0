import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

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

// Create or get the model
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
    
    const { explanation } = body;
    
    if (!explanation) {
      return NextResponse.json(
        { error: 'Explanation is required' },
        { status: 400 }
      );
    }
    
    const causalExpCorrSubmission = new CausalExpCorr({
      explanation
    });
    
    await causalExpCorrSubmission.save();
    
    return NextResponse.json({ success: true, id: causalExpCorrSubmission._id, collection: 'causalExpCorr' });
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