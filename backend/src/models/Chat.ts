import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Do not create a separate _id for subdocuments
);

const ChatSessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Each user has one main chat session for simplicity
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);

export default ChatSession;