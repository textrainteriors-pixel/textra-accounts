import Reminder from '../models/Reminder.js';

// @desc    Get all reminders for logged-in user
// @route   GET /api/reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id });
    // Map _id to id for frontend consistency if needed
    const formattedReminders = reminders.map(r => ({
      id: r._id,
      text: r.text,
      date: r.date,
      completed: r.completed || false,
      createdAt: r.createdAt
    }));
    res.json(formattedReminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
export const createReminder = async (req, res) => {
  try {
    const { text, date } = req.body;

    if (!text || !date) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const reminder = await Reminder.create({
      text,
      date,
      user: req.user._id
    });

    res.status(201).json({
      id: reminder._id,
      text: reminder.text,
      date: reminder.date,
      completed: reminder.completed || false,
      createdAt: reminder.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check user ownership
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { text, date, completed } = req.body;
    if (text !== undefined) reminder.text = text;
    if (date !== undefined) reminder.date = date;
    if (completed !== undefined) reminder.completed = completed;

    const updatedReminder = await reminder.save();

    res.json({
      id: updatedReminder._id,
      text: updatedReminder.text,
      date: updatedReminder.date,
      completed: updatedReminder.completed,
      createdAt: updatedReminder.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Check user ownership
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Reminder.deleteOne({ _id: req.params.id });
    res.json({ message: 'Reminder removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
