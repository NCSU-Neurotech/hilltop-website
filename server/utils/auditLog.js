const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

/**
 * Log an action to the audit trail
 * @param {string} facilityId - Facility ID
 * @param {string} action - Action type (edit_child, delete_child, etc.)
 * @param {string} entityType - Type of entity affected (Child, CommTile, SoundBoard)
 * @param {string} entityId - ID of affected entity
 * @param {object} changes - Changes made (for mutations)
 */
async function logAction(facilityId, action, entityType, entityId, changes = null) {
  try {
    await prisma.auditLog.create({
      data: {
        facilityId,
        action,
        entityType,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    })
  } catch (err) {
    console.error('Audit log error:', err.message)
    // Don't throw — audit logging failure should not crash requests
  }
}

/**
 * Fetch audit logs with filtering
 * @param {string} facilityId - Facility ID
 * @param {object} filters - Filter options (action, entityType, startDate, endDate, limit)
 */
async function fetchAuditLogs(facilityId, filters = {}) {
  const {
    action = null,
    entityType = null,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date(),
    limit = 50,
  } = filters

  const where = {
    facilityId,
    timestamp: {
      gte: startDate,
      lte: endDate,
    },
  }

  if (action) where.action = action
  if (entityType) where.entityType = entityType

  return prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

module.exports = { logAction, fetchAuditLogs }
