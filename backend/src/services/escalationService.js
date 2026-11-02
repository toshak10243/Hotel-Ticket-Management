const prisma = require('../config/db');

/**
 * Checks for tickets that have been in 'Pending' or 'Assigned' state for > 30 minutes
 * and automatically marks them as escalated with an audit log.
 */
async function checkAndApply30MinEscalations() {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Find requests created or updated > 30 mins ago that are not yet InProgress/Resolved/Closed
    const unaddressedTickets = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ['Pending', 'Assigned'] },
        createdAt: { lte: thirtyMinutesAgo },
        isEscalated: false,
      },
    });

    for (const ticket of unaddressedTickets) {
      await prisma.serviceRequest.update({
        where: { id: ticket.id },
        data: {
          isEscalated: true,
          priority: 'High',
          escalationReason: 'Auto-escalated: Ticket unresolved after 30 minutes threshold (SLA Breach)',
        },
      });

      await prisma.requestHistory.create({
        data: {
          requestId: ticket.id,
          previousStatus: ticket.status,
          newStatus: ticket.status,
          remarks: '[SYSTEM SLA ALERT]: Ticket automatically escalated to High Priority due to 30-minute inactivity.',
        },
      });
    }

    return unaddressedTickets.length;
  } catch (error) {
    console.error('Error in 30-minute escalation check:', error);
    return 0;
  }
}

/**
 * Formats a clean WhatsApp message and creates a direct wa.me link for staff notification
 */
function createWhatsAppNotificationUrl(phoneNumber, ticket) {
  if (!phoneNumber) return null;
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(
    `*Hotel Arya Niwas - New Ticket Notification*\n` +
    `Ticket ID: ${ticket.ticketId}\n` +
    `Room: ${ticket.roomNumber}\n` +
    `Category: ${ticket.category}\n` +
    `Priority: ${ticket.priority}\n` +
    `Details: ${ticket.description}\n` +
    `Status: ${ticket.status}\n` +
    `Time: ${new Date().toLocaleTimeString()}`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

module.exports = {
  checkAndApply30MinEscalations,
  createWhatsAppNotificationUrl,
};
