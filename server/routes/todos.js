import express from 'express';
import Todo from '../models/Todo.js';
import User from '../models/User.js';

const router = express.Router();

// Get user's todos
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignedBy } = req.query;
    const userId = req.user._id;

    let filter = {
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
        { 'sharedWith.user': userId }
      ]
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedBy) filter.createdBy = assignedBy;

    const todos = await Todo.find(filter)
      .populate('createdBy', 'username displayName avatar')
      .populate('assignedTo', 'username displayName avatar')
      .populate('conversation.user', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new todo
router.post('/', async (req, res) => {
  try {
    const { content, assignedTo, dueDate, dueTime, priority, tags } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Todo content is required' });
    }

    let assignedUser = null;
    if (assignedTo) {
      if (assignedTo.startsWith('@')) {
        // Find user by username
        assignedUser = await User.findOne({ username: assignedTo.substring(1).toLowerCase() });
      } else {
        // Find user by ID
        assignedUser = await User.findById(assignedTo);
      }

      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
    }

    const todo = new Todo({
      content: content.trim(),
      createdBy: req.user._id,
      assignedTo: assignedUser ? assignedUser._id : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime,
      priority: priority || 'medium',
      tags: tags || [],
      isShared: !!assignedUser
    });

    await todo.save();
    await todo.populate([
      { path: 'createdBy', select: 'username displayName avatar' },
      { path: 'assignedTo', select: 'username displayName avatar' }
    ]);

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const todo = await Todo.findOne({
      _id: id,
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
        { 'sharedWith.user': userId }
      ]
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check permissions
    const canEdit = todo.createdBy.toString() === userId.toString() || 
                   todo.sharedWith.some(share => 
                     share.user.toString() === userId.toString() && share.permissions === 'edit'
                   );

    if (!canEdit && Object.keys(updates).some(key => key !== 'status')) {
      return res.status(403).json({ message: 'Insufficient permissions to edit this todo' });
    }

    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        todo[key] = updates[key];
      }
    });

    await todo.save();
    await todo.populate([
      { path: 'createdBy', select: 'username displayName avatar' },
      { path: 'assignedTo', select: 'username displayName avatar' },
      { path: 'conversation.user', select: 'username displayName avatar' }
    ]);

    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to todo
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    const todo = await Todo.findOne({
      _id: id,
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
        { 'sharedWith.user': userId }
      ]
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    todo.conversation.push({
      user: userId,
      message: message.trim(),
      timestamp: new Date()
    });

    await todo.save();
    await todo.populate([
      { path: 'createdBy', select: 'username displayName avatar' },
      { path: 'assignedTo', select: 'username displayName avatar' },
      { path: 'conversation.user', select: 'username displayName avatar' }
    ]);

    res.json(todo);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const todo = await Todo.findOne({
      _id: id,
      createdBy: userId
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found or insufficient permissions' });
    }

    await Todo.findByIdAndDelete(id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;