/**
 * Filters out messages with empty or non-string content.
 *
 * @param {Array} messages - Array of message objects with a `content` property.
 * @returns {Array} Messages that have non-empty string content.
 */
function filterEmptyMessages(messages) {
  return messages.filter(m =>
    typeof m.content === 'string' && m.content.trim() !== ''
  );
}

module.exports = { filterEmptyMessages };
