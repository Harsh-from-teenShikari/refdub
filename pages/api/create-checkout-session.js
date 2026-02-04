import { createSubscription } from '@/lib/payments';
import { getUser } from '@/utils/supabase-admin';
import { createOrRetrieveCustomer } from '@/utils/useDatabase';
import { getURL } from '@/utils/helpers';

const createCheckoutSession = async (req, res) => {
  if (req.method === 'POST') {
    const token = req.headers.token;
    const { price, quantity = 1, metadata = {} } = req.body;

    try {
      const user = await getUser(token);
      const customer = await createOrRetrieveCustomer({
        id: user.id,
        teamId: user.team_id,
        email: user.email
      });

      const session = await createSubscription({
        customer,
        price,
        quantity,
        metadata,
        success_url: `${getURL()}/dashboard`,
        cancel_url: `${getURL()}/`
      });

      return res.status(200).json({ sessionId: session.id });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default createCheckoutSession;
