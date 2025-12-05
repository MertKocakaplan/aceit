const prisma = require('../config/database');
const logger = require('../utils/logger');
const { checkSubjectAccess } = require('./subject.service');

/**
 * Kullanıcının tüm planlarını getir
 */
const getUserPlans = async (userId) => {
  try {
    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      include: {
        days: {
          select: {
            id: true,
            date: true,
            _count: {
              select: { slots: true }
            }
          }
        },
        _count: {
          select: {
            days: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Her plan için completion rate hesapla
    const plansWithProgress = await Promise.all(
      plans.map(async (plan) => {
        const progress = await getPlanProgress(plan.id, userId);
        return {
          ...plan,
          progress
        };
      })
    );

    return plansWithProgress;
  } catch (error) {
    logger.error(`getUserPlans error: ${error.message}`);
    throw error;
  }
};

/**
 * Aktif planı getir
 */
const getActivePlan = async (userId) => {
  try {
    const plan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        isActive: true
      },
      include: {
        days: {
          include: {
            slots: {
              include: {
                subject: {
                  select: { id: true, name: true, code: true, color: true }
                },
                topic: {
                  select: { id: true, name: true, code: true }
                }
              },
              orderBy: { startTime: 'asc' }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    return plan;
  } catch (error) {
    logger.error(`getActivePlan error: ${error.message}`);
    throw error;
  }
};

/**
 * Tek bir planı getir
 */
const getPlanById = async (planId, userId) => {
  try {
    const plan = await prisma.studyPlan.findFirst({
      where: {
        id: planId,
        userId
      },
      include: {
        days: {
          include: {
            slots: {
              include: {
                subject: {
                  select: { id: true, name: true, code: true, color: true }
                },
                topic: {
                  select: { id: true, name: true, code: true }
                }
              },
              orderBy: { startTime: 'asc' }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!plan) {
      throw new Error('Plan bulunamadı');
    }

    // Progress hesapla ve ekle
    const progress = await calculatePlanProgress(planId);

    return {
      ...plan,
      progress
    };
  } catch (error) {
    logger.error(`getPlanById error: ${error.message}`);
    throw error;
  }
};

/**
 * Yeni plan oluştur
 */
const createPlan = async (userId, planData) => {
  try {
    const { title, description, startDate, endDate, isActive } = planData;

    // Tarih validasyonu
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
    }

    // Transaction: isActive = true yapılırsa diğer planları deaktif et
    const plan = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.studyPlan.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false }
        });
      }

      return await tx.studyPlan.create({
        data: {
          userId,
          title,
          description,
          startDate: start,
          endDate: end,
          isActive: isActive !== undefined ? isActive : true,
          isAIGenerated: false
        },
        include: {
          days: {
            include: {
              slots: true
            }
          }
        }
      });
    });

    logger.info(`Plan created: ${plan.id}`);
    return plan;
  } catch (error) {
    logger.error(`createPlan error: ${error.message}`);
    throw error;
  }
};

/**
 * Planı güncelle
 */
const updatePlan = async (planId, userId, updateData) => {
  try {
    // Ownership check
    const existingPlan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId }
    });

    if (!existingPlan) {
      throw new Error('Plan bulunamadı');
    }

    // Tarih validasyonu (eğer değişiyorsa)
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);

      if (start >= end) {
        throw new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      }
    }

    // Transaction: isActive değişiyorsa
    const plan = await prisma.$transaction(async (tx) => {
      if (updateData.isActive === true && !existingPlan.isActive) {
        await tx.studyPlan.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false }
        });
      }

      return await tx.studyPlan.update({
        where: { id: planId },
        data: updateData,
        include: {
          days: {
            include: {
              slots: true
            }
          }
        }
      });
    });

    logger.info(`Plan updated: ${planId}`);
    return plan;
  } catch (error) {
    logger.error(`updatePlan error: ${error.message}`);
    throw error;
  }
};

/**
 * Planı sil
 */
const deletePlan = async (planId, userId) => {
  try {
    // Ownership check
    const existingPlan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId }
    });

    if (!existingPlan) {
      throw new Error('Plan bulunamadı');
    }

    // Cascade delete (days ve slots otomatik silinecek)
    await prisma.studyPlan.delete({
      where: { id: planId }
    });

    logger.info(`Plan deleted: ${planId}`);
    return { message: 'Plan başarıyla silindi' };
  } catch (error) {
    logger.error(`deletePlan error: ${error.message}`);
    throw error;
  }
};

/**
 * Planı aktif yap
 */
const activatePlan = async (planId, userId) => {
  try {
    // Ownership check
    const existingPlan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId }
    });

    if (!existingPlan) {
      throw new Error('Plan bulunamadı');
    }

    // Transaction: Diğer planları deaktif et
    const plan = await prisma.$transaction(async (tx) => {
      await tx.studyPlan.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });

      return await tx.studyPlan.update({
        where: { id: planId },
        data: { isActive: true }
      });
    });

    logger.info(`Plan activated: ${planId}`);
    return plan;
  } catch (error) {
    logger.error(`activatePlan error: ${error.message}`);
    throw error;
  }
};

/**
 * Day oluştur (manuel plan creation için)
 */
const createDay = async (planId, userId, dayData) => {
  try {
    // Plan ownership check
    const plan = await prisma.studyPlan.findFirst({
      where: {
        id: planId,
        userId
      }
    });

    if (!plan) {
      throw new Error('Plan bulunamadı');
    }

    // Create day
    const day = await prisma.studyPlanDay.create({
      data: {
        planId,
        date: new Date(dayData.date),
        dailyGoalMinutes: dayData.dailyGoalMinutes || 0
      }
    });

    logger.info(`Day created for plan ${planId}: ${day.id}`);
    return day;
  } catch (error) {
    logger.error(`createDay error: ${error.message}`);
    throw error;
  }
};

/**
 * Slot oluştur
 */
const createSlot = async (dayId, userId, slotData) => {
  try {
    // Day ownership check
    const day = await prisma.studyPlanDay.findFirst({
      where: {
        id: dayId,
        plan: { userId }
      }
    });

    if (!day) {
      throw new Error('Gün bulunamadı');
    }

    // Subject access check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examType: true }
    });

    const subject = await prisma.subject.findUnique({
      where: { id: slotData.subjectId }
    });

    if (!subject) {
      throw new Error('Ders bulunamadı');
    }

    const canAccess = checkSubjectAccess(user.examType, subject);
    if (!canAccess) {
      throw new Error('Bu ders sizin sınav türünüze uygun değil');
    }

    // Time overlap validation
    await validateSlotTime(dayId, slotData.startTime, slotData.endTime);

    // Duration hesaplama
    const duration = calculateDuration(slotData.startTime, slotData.endTime);

    const slot = await prisma.studyPlanSlot.create({
      data: {
        dayId,
        subjectId: slotData.subjectId,
        topicId: slotData.topicId || null,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        duration,
        priority: slotData.priority || 3,
        slotType: slotData.slotType || 'study',
        notes: slotData.notes || null,
        aiReason: slotData.aiReason || null
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true }
        },
        topic: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    logger.info(`Slot created: ${slot.id}`);
    return slot;
  } catch (error) {
    logger.error(`createSlot error: ${error.message}`);
    throw error;
  }
};

/**
 * Slot güncelle
 */
const updateSlot = async (slotId, userId, updateData) => {
  try {
    // Ownership check
    const existingSlot = await prisma.studyPlanSlot.findFirst({
      where: {
        id: slotId,
        day: {
          plan: { userId }
        }
      },
      include: {
        day: true
      }
    });

    if (!existingSlot) {
      throw new Error('Slot bulunamadı');
    }

    // Time validation (eğer değişiyorsa)
    if (updateData.startTime || updateData.endTime) {
      const newStartTime = updateData.startTime || existingSlot.startTime;
      const newEndTime = updateData.endTime || existingSlot.endTime;

      await validateSlotTime(existingSlot.dayId, newStartTime, newEndTime, slotId);

      // Duration yeniden hesapla
      updateData.duration = calculateDuration(newStartTime, newEndTime);
    }

    const slot = await prisma.studyPlanSlot.update({
      where: { id: slotId },
      data: updateData,
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true }
        },
        topic: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    logger.info(`Slot updated: ${slotId}`);
    return slot;
  } catch (error) {
    logger.error(`updateSlot error: ${error.message}`);
    throw error;
  }
};

/**
 * Slot'u tamamlandı olarak işaretle
 */
const markSlotComplete = async (slotId, userId, completed) => {
  try {
    // Ownership check
    const existingSlot = await prisma.studyPlanSlot.findFirst({
      where: {
        id: slotId,
        day: {
          plan: { userId }
        }
      }
    });

    if (!existingSlot) {
      throw new Error('Slot bulunamadı');
    }

    const slot = await prisma.studyPlanSlot.update({
      where: { id: slotId },
      data: {
        isCompleted: completed,
        completedAt: completed ? new Date() : null
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true }
        },
        topic: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    logger.info(`Slot marked ${completed ? 'complete' : 'incomplete'}: ${slotId}`);
    return slot;
  } catch (error) {
    logger.error(`markSlotComplete error: ${error.message}`);
    throw error;
  }
};

/**
 * Slot sil
 */
const deleteSlot = async (slotId, userId) => {
  try {
    // Ownership check
    const existingSlot = await prisma.studyPlanSlot.findFirst({
      where: {
        id: slotId,
        day: {
          plan: { userId }
        }
      }
    });

    if (!existingSlot) {
      throw new Error('Slot bulunamadı');
    }

    await prisma.studyPlanSlot.delete({
      where: { id: slotId }
    });

    logger.info(`Slot deleted: ${slotId}`);
    return { message: 'Slot başarıyla silindi' };
  } catch (error) {
    logger.error(`deleteSlot error: ${error.message}`);
    throw error;
  }
};

/**
 * Plan progress hesapla
 */
const getPlanProgress = async (planId, userId) => {
  try {
    // Ownership check
    const plan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId }
    });

    if (!plan) {
      throw new Error('Plan bulunamadı');
    }

    // Tüm slot'ları say
    const totalSlots = await prisma.studyPlanSlot.count({
      where: {
        day: {
          planId
        }
      }
    });

    // Tamamlanan slot'ları say
    const completedSlots = await prisma.studyPlanSlot.count({
      where: {
        day: {
          planId
        },
        isCompleted: true
      }
    });

    // Ders bazlı breakdown
    const subjectBreakdown = await prisma.studyPlanSlot.groupBy({
      by: ['subjectId'],
      where: {
        day: {
          planId
        }
      },
      _count: {
        _all: true
      },
      _sum: {
        duration: true
      }
    });

    // Subject bilgilerini ekle
    const subjectBreakdownWithInfo = await Promise.all(
      subjectBreakdown.map(async (item) => {
        const subject = await prisma.subject.findUnique({
          where: { id: item.subjectId },
          select: { name: true, code: true, color: true }
        });

        const completedCount = await prisma.studyPlanSlot.count({
          where: {
            day: { planId },
            subjectId: item.subjectId,
            isCompleted: true
          }
        });

        return {
          ...item,
          subject,
          completedCount
        };
      })
    );

    const completionRate = totalSlots > 0 ? (completedSlots / totalSlots) * 100 : 0;

    return {
      totalSlots,
      completedSlots,
      completionRate: Math.round(completionRate * 10) / 10,
      subjectBreakdown: subjectBreakdownWithInfo
    };
  } catch (error) {
    logger.error(`getPlanProgress error: ${error.message}`);
    throw error;
  }
};

/**
 * Internal helper: Calculate plan progress without ownership check
 */
async function calculatePlanProgress(planId) {
  const totalSlots = await prisma.studyPlanSlot.count({
    where: { day: { planId } }
  });

  const completedSlots = await prisma.studyPlanSlot.count({
    where: { day: { planId }, isCompleted: true }
  });

  const completionRate = totalSlots > 0 ? (completedSlots / totalSlots) * 100 : 0;

  return {
    totalSlots,
    completedSlots,
    completionRate: Math.round(completionRate * 10) / 10
  };
}

/**
 * Time overlap validation helper
 */
async function validateSlotTime(dayId, startTime, endTime, excludeSlotId = null) {
  const existingSlots = await prisma.studyPlanSlot.findMany({
    where: {
      dayId,
      id: excludeSlotId ? { not: excludeSlotId } : undefined
    },
    select: { startTime: true, endTime: true }
  });

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newStart = parseTime(startTime);
  const newEnd = parseTime(endTime);

  if (newStart >= newEnd) {
    throw new Error('Bitiş saati başlangıç saatinden sonra olmalıdır');
  }

  for (const slot of existingSlots) {
    const existingStart = parseTime(slot.startTime);
    const existingEnd = parseTime(slot.endTime);

    // Overlap check: (newStart < existingEnd) AND (newEnd > existingStart)
    if (newStart < existingEnd && newEnd > existingStart) {
      throw new Error('Bu zaman aralığında başka bir slot var');
    }
  }

  return true;
}

/**
 * Duration helper (dakika cinsinden)
 */
function calculateDuration(startTime, endTime) {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return parseTime(endTime) - parseTime(startTime);
}

module.exports = {
  getUserPlans,
  getActivePlan,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  activatePlan,
  createDay,
  createSlot,
  updateSlot,
  markSlotComplete,
  deleteSlot,
  getPlanProgress
};
