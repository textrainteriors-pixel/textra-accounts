import Reminder from '../models/Reminder.js';

// @desc    Get all reminders for logged-in user
// @route   GET /api/reminders
export const getReminders = async (req, res) => {
  try {
    // Clean up any legacy duplicate completed records for active monthly repeating reminders
    const activeMonthlyReminders = await Reminder.find({ user: req.user._id, repeatMonthly: true, completed: false });
    const activeMonthlyTexts = activeMonthlyReminders.map(r => r.text);
    if (activeMonthlyTexts.length > 0) {
      await Reminder.deleteMany({
        user: req.user._id,
        repeatMonthly: true,
        completed: true,
        text: { $in: activeMonthlyTexts }
      });
    }

    const reminders = await Reminder.find({ user: req.user._id });

    // Format response
    const formattedReminders = reminders.map(r => ({
      id: r._id,
      text: r.text,
      date: r.date,
      completed: r.completed || false,
      repeatMonthly: r.repeatMonthly || false,
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
    const { text, date, repeatMonthly } = req.body;

    if (!text || !date) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const reminder = await Reminder.create({
      text,
      date,
      user: req.user._id,
      repeatMonthly: Boolean(repeatMonthly)
    });

    res.status(201).json({
      id: reminder._id,
      text: reminder.text,
      date: reminder.date,
      completed: reminder.completed || false,
      repeatMonthly: reminder.repeatMonthly || false,
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

    const { text, date, completed, repeatMonthly } = req.body;
    if (text !== undefined) reminder.text = text;
    if (date !== undefined) reminder.date = date;
    if (repeatMonthly !== undefined) reminder.repeatMonthly = repeatMonthly;

    if (completed !== undefined) {
      const wasCompletedBefore = reminder.completed;

      // If marking as completed and it's a monthly repeating reminder, advance date to next month directly
      if (completed && !wasCompletedBefore && reminder.repeatMonthly) {
        const parts = reminder.date.split('-');
        if (parts.length === 3) {
          let year = parseInt(parts[0], 10);
          let month = parseInt(parts[1], 10); // 1-12
          let day = parseInt(parts[2], 10);

          month += 1;
          if (month > 12) {
            month = 1;
            year += 1;
          }

          const daysInNextMonth = new Date(year, month, 0).getDate();
          if (day > daysInNextMonth) {
            day = daysInNextMonth;
          }

          reminder.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          reminder.completed = false; // Reset completion for the new month

          // Delete any legacy duplicate completed records for this monthly reminder
          await Reminder.deleteMany({
            user: req.user._id,
            text: reminder.text,
            repeatMonthly: true,
            completed: true
          });
        }
      } else {
        reminder.completed = completed;
      }
    }

    await reminder.save();

    res.json({
      id: reminder._id,
      text: reminder.text,
      date: reminder.date,
      completed: reminder.completed,
      repeatMonthly: reminder.repeatMonthly,
      createdAt: reminder.createdAt
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
