/**
 * Product switches.
 *
 * PRO_SALES_PAUSED (2026-10-31): Pro checkout is temporarily closed until the
 * site is approved by Google AdSense — paid subscriptions shouldn't be
 * pitch­ed while the site is under ad review and has no ads running yet.
 * Every upgrade CTA hides when this is true, the /upgrade page explains the
 * pause instead of offering checkout, and the billing portal stays available
 * to existing Pro subscribers. Flip to `false` once AdSense is approved and
 * ads are live.
 */
export const PRO_SALES_PAUSED = true;
