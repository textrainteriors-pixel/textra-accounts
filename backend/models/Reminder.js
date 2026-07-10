import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  date: {
    type: String, // String format 'YYYY-MM-DD' for robust local date matching
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;
