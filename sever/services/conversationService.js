const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

exports.createConversation = async (userId, topic) => {
  if (!userId || !topic) {
    throw Object.assign(new Error("Missing userId or topic"), { status: 400 });
  }

  const existingConversation = await Conversation.findOne({ userId, topic });
  if (existingConversation) { 
    throw Object.assign(new Error("User already has a conversation with this topic."), {
      status: 400,
      data: existingConversation,
    });
  }

  return await Conversation.create({ userId, topic });
};

exports.getUserConversations = async (userId) => {
  if (!userId) {
    throw Object.assign(new Error("Missing userId"), { status: 400 });
  }

  return await Conversation.find({ userId })
    .populate("userId", "name email")
    .populate("nutritionistId", "name email");
};

exports.updateStatusConversation = async (conversationId, nutritionistId, status) => {
  if (!conversationId || !nutritionistId) {
    throw Object.assign(new Error("Missing conversationId or nutritionistId"), { status: 400 });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw Object.assign(new Error("Conversation not found"), { status: 404 });
  }

  if (conversation.nutritionistId) {
    throw Object.assign(new Error("Conversation already assigned to a nutritionist"), {
      status: 400,
    });
  }

  if (status === "checked" && !conversation.checkedBy.includes(nutritionistId)) {
    conversation.checkedBy.push(nutritionistId);
    conversation.status = "checked";
  } else if (status === "active") {
    conversation.nutritionistId = nutritionistId;
    conversation.status = "active";
  } else {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }

  return await conversation.save();
};

exports.createMessage = async (conversationId, senderId, text, imageUrl, videoUrl, type) => {
  if (!conversationId || !senderId) {
    throw Object.assign(new Error("Missing conversationId or senderId"), { status: 400 });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw Object.assign(new Error("Conversation not found"), { status: 404 });
  }

  if (
    conversation.status === "pending" &&
    !conversation.nutritionistId &&
    senderId !== conversation.userId.toString()
  ) {
    conversation.nutritionistId = senderId;
    conversation.status = "active";
    await conversation.save();
  }

  const isUser = senderId === conversation.userId.toString();
  const isNutritionist =
    conversation.nutritionistId && senderId === conversation.nutritionistId.toString();

  if (!isUser && !isNutritionist) {
    throw Object.assign(new Error("Not authorized to send message in this conversation"), {
      status: 403,
    });
  }

  const message = await Message.create({
    conversationId,
    senderId,
    text,
    imageUrl,
    videoUrl,
    type: type || "text",
  });

  conversation.messages.push(message._id);
  conversation.lastMessage = text || imageUrl || videoUrl || "New message";
  conversation.updatedAt = Date.now();
  await conversation.save();

  return message;
};

exports.getMessages = async (conversationId) => {
  if (!conversationId) {
    throw Object.assign(new Error("Missing conversationId"), { status: 400 });
  }

  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: "messages",
      model: "Message",
    })
    .exec();

  if (!conversation) {
    throw Object.assign(new Error("Conversation not found"), { status: 404 });
  }

  return conversation.messages || [];
};

exports.getCheckedConversations = async (userId) => {
  if (!userId) {
    throw Object.assign(new Error("Missing userId"), { status: 400 });
  }

  return await Conversation.find({
    checkedBy: userId,
    status: "checked",
  }).populate("userId", "username email");
};

exports.getActiveConversations = async (userId) => {
  if (!userId) {
    throw Object.assign(new Error("Missing userId"), { status: 400 });
  }

  const conversations = await Conversation.find({
    nutritionistId: userId,
    status: "active",
  })
    .populate("userId", "name email")
    .populate("nutritionistId", "name email")
    .exec();

  if (!conversations || conversations.length === 0) {
    throw Object.assign(new Error("No active conversations found"), { status: 404 });
  }

  return conversations;
};

exports.getPendingConversations = async () => {
  return await Conversation.find({
    status: "pending",
    nutritionistId: null,
  })
    .populate("userId", "name email")
    .populate("nutritionistId", "name email")
    .exec();
};
