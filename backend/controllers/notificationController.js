import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { deliverNotification } from '../utils/notificationDelivery.js';

export const getNotifications = async (req, res, next) => {
  try {
    // Les comptes pedagogiques gardent une boite separee; l'administration conserve une vue globale.
    const filter = ['student', 'teacher'].includes(req.user?.role)
      ? { $or: [{ recipientUser: req.user._id }, { recipientRole: 'all' }] }
      : {};

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('recipientUser', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const isGeneral = req.body.recipientRole === 'all';
    const recipientEmail = String(req.body.recipient || '').match(/\S+@\S+\.\S+/)?.[0] || req.body.recipient;
    // Pour une notification ciblee, on stocke l'utilisateur exact afin d'eviter les fuites entre comptes.
    const recipientUser = isGeneral
      ? null
      : await User.findOne({ email: recipientEmail, role: req.body.recipientRole }).lean();

    if (!isGeneral && !recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Aucun etudiant/professeur ne correspond a ce destinataire',
      });
    }

    const delivery = isGeneral
      ? { status: 'dev', detail: 'Notification generale plateforme' }
      : await deliverNotification({
          channel: req.body.channel,
          recipient: recipientUser.email,
          recipientRole: req.body.recipientRole,
          recipientUserId: recipientUser._id,
          subject: req.body.subject,
          message: req.body.message,
        });

    const notification = await Notification.create({
      ...req.body,
      recipient: isGeneral ? 'Tous les utilisateurs' : recipientUser.email,
      recipientUser: recipientUser?._id,
      status: delivery.status,
      deliveryDetail: delivery.detail,
      createdBy: req.user?._id,
    });

    if (delivery.status === 'dev') {
      console.log(`[notification:${notification.channel}] ${notification.recipient} - ${notification.subject || 'Sans objet'}: ${notification.message}`);
    }

    res.status(201).json({
      success: true,
      message: delivery.status === 'sent'
        ? 'Notification envoyee et enregistree'
        : `Notification plateforme enregistree (${delivery.detail})`,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvee' });
    }

    res.json({
      success: true,
      message: 'Notification mise a jour',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification non trouvee' });
    }

    res.json({ success: true, message: 'Notification supprimee' });
  } catch (error) {
    next(error);
  }
};
