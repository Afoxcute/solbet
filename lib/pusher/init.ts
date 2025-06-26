import Pusher from 'pusher-js';

const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: "us3"
});

export default pusherClient;
