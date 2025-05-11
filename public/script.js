function sendFriendRequest(toUsername) {
  fetch('/send-friend-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUsername })
  }).then(res => res.text()).then(alert);
}

function acceptFriend(fromId) {
  fetch('/accept-friend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId })
  }).then(res => res.text()).then(alert);
}
