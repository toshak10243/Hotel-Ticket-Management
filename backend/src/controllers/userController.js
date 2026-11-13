const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

// GET /api/users (Admin / Manager)
// Includes active workload count for each staff member
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute active workload (tickets with status Assigned or InProgress) for each user
    const usersWithWorkload = await Promise.all(
      users.map(async (u) => {
        const activeCount = await prisma.serviceRequest.count({
          where: {
            assignedToStaff: u.name,
            status: { in: ['Assigned', 'InProgress'] },
          },
        });

        const resolvedCount = await prisma.serviceRequest.count({
          where: {
            assignedToStaff: u.name,
            status: { in: ['Resolved', 'Closed'] },
          },
        });

        const MAX_LOAD = 5;
        const isOccupied = activeCount >= MAX_LOAD;

        return {
          ...u,
          activeWorkload: activeCount,
          resolvedTotal: resolvedCount,
          maxCapacity: MAX_LOAD,
          isOccupied,
        };
      })
    );

    return res.json({ users: usersWithWorkload });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// POST /api/users (Admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validRoles = ['Admin', 'Manager', 'Staff'];
    const assignedRole = validRoles.includes(role) ? role : 'Staff';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: phone ? phone.trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'Staff account created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user account' });
  }
};

// PUT /api/users/:id (Admin only: Edit staff details & change admin name in DB)
const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { name, email, password, role, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== existing.email) {
        const emailCheck = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (emailCheck) {
          return res.status(400).json({ error: 'Email already in use by another user' });
        }
        updateData.email = normalizedEmail;
      }
    }
    if (role) {
      const validRoles = ['Admin', 'Manager', 'Staff'];
      if (validRoles.includes(role)) {
        updateData.role = role;
      }
    }
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password.trim(), salt);
    }

    // If staff name was updated, update past assignedToStaff references in active requests
    if (name && name.trim() !== existing.name) {
      await prisma.serviceRequest.updateMany({
        where: { assignedToStaff: existing.name },
        data: { assignedToStaff: name.trim() },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: 'User account updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE /api/users/:id (Admin only)
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (req.user && req.user.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
