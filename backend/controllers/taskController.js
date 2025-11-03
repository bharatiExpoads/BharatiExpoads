const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TaskController = {
  // Get all tasks (admin sees all, employees see assigned tasks)
  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let tasks;
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        // Admin sees all tasks they created
        tasks = await prisma.task.findMany({
          where: { createdById: userId },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            campaign: {
              select: {
                id: true,
                campaignNumber: true,
                customerName: true
              }
            },
            hoarding: {
              select: {
                id: true,
                location: true
              }
            },
            updates: {
              include: {
                updatedBy: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: [
            { status: 'asc' },
            { priority: 'desc' },
            { dueDate: 'asc' }
          ]
        });
      } else {
        // Employees see tasks assigned to them
        tasks = await prisma.task.findMany({
          where: { assignedToId: userId },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            campaign: {
              select: {
                id: true,
                campaignNumber: true,
                customerName: true
              }
            },
            hoarding: {
              select: {
                id: true,
                location: true
              }
            },
            updates: {
              include: {
                updatedBy: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          },
          orderBy: [
            { status: 'asc' },
            { priority: 'desc' },
            { dueDate: 'asc' }
          ]
        });
      }

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get task by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const task = await prisma.task.findFirst({
        where: {
          id,
          OR: [
            { createdById: userId },
            { assignedToId: userId }
          ]
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          campaign: {
            select: {
              id: true,
              campaignNumber: true,
              customerName: true,
              startDate: true,
              endDate: true
            }
          },
          hoarding: {
            select: {
              id: true,
              location: true,
              width: true,
              height: true,
              totalSqFt: true
            }
          },
          updates: {
            include: {
              updatedBy: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Create new task
  async create(req, res) {
    try {
      const { title, description, priority, dueDate, assignedToId, campaignId, hoardingId } = req.body;
      const createdById = req.user.id;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Validate assignedToId if provided
      if (assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: assignedToId }
        });
        if (!assignee) {
          return res.status(400).json({ error: 'Assigned user not found' });
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          createdById,
          assignedToId: assignedToId || null,
          campaignId: campaignId ? parseInt(campaignId) : null,
          hoardingId: hoardingId || null
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          campaign: {
            select: {
              id: true,
              campaignNumber: true
            }
          },
          hoarding: {
            select: {
              id: true,
              location: true
            }
          }
        }
      });

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update task
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, priority, status, dueDate, assignedToId } = req.body;
      const userId = req.user.id;

      // Check if user has permission to update
      const existingTask = await prisma.task.findFirst({
        where: {
          id,
          OR: [
            { createdById: userId },
            { assignedToId: userId }
          ]
        }
      });

      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found or access denied' });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'COMPLETED') {
          updateData.completedAt = new Date();
        }
      }
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;

      const task = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          campaign: true,
          hoarding: true
        }
      });

      res.json({ message: 'Task updated successfully', task });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete task
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Only creator can delete
      const task = await prisma.task.findFirst({
        where: {
          id,
          createdById: userId
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found or access denied' });
      }

      await prisma.task.delete({
        where: { id }
      });

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Add update/comment to task
  async addUpdate(req, res) {
    try {
      const { id } = req.params;
      const { comment, status } = req.body;
      const userId = req.user.id;

      if (!comment) {
        return res.status(400).json({ error: 'Comment is required' });
      }

      // Check if user has access to task
      const task = await prisma.task.findFirst({
        where: {
          id,
          OR: [
            { createdById: userId },
            { assignedToId: userId }
          ]
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found or access denied' });
      }

      // Create update
      const update = await prisma.taskUpdate.create({
        data: {
          comment,
          status: status || null,
          taskId: id,
          userId
        },
        include: {
          updatedBy: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Update task status if provided
      if (status) {
        const updateData = { status };
        if (status === 'COMPLETED') {
          updateData.completedAt = new Date();
        }
        await prisma.task.update({
          where: { id },
          data: updateData
        });
      }

      res.status(201).json({ message: 'Update added successfully', update });
    } catch (error) {
      console.error('Error adding task update:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get task statistics
  async getStats(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const where = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
        ? { createdById: userId }
        : { assignedToId: userId };

      const [total, todo, inProgress, inReview, completed, cancelled, overdue] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: 'TODO' } }),
        prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { ...where, status: 'IN_REVIEW' } }),
        prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.task.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.task.count({
          where: {
            ...where,
            status: { not: 'COMPLETED' },
            dueDate: { lt: new Date() }
          }
        })
      ]);

      res.json({
        total,
        byStatus: {
          todo,
          inProgress,
          inReview,
          completed,
          cancelled
        },
        overdue
      });
    } catch (error) {
      console.error('Error fetching task stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = TaskController;
