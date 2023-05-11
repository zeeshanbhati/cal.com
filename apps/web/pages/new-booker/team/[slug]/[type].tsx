import type { GetServerSidePropsContext } from "next";
import { z } from "zod";

import { Booker } from "@calcom/atoms";
import { BookerSeo } from "@calcom/features/bookings/components/BookerSeo";
import { getBookingByUidOrRescheduleUid } from "@calcom/features/bookings/lib/get-booking";
import type { GetBookingType } from "@calcom/features/bookings/lib/get-booking";
import prisma from "@calcom/prisma";

import type { inferSSRProps } from "@lib/types/inferSSRProps";

import PageWrapper from "@components/PageWrapper";

type PageProps = inferSSRProps<typeof getServerSideProps>;

export default function Type({ slug, user, booking, away }: PageProps) {
  return (
    <main className="flex h-full min-h-[100dvh] items-center justify-center">
      <BookerSeo username={user} eventSlug={slug} rescheduleUid={booking?.uid} />
      <Booker username={user} eventSlug={slug} rescheduleBooking={booking} isAway={away} />
    </main>
  );
}

Type.PageWrapper = PageWrapper;

const paramsSchema = z.object({ type: z.string(), slug: z.string() });

// Booker page fetches a tiny bit of data server side:
// 1. Check if team exists, to show 404
// 2. If rescheduling, get the booking details
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { slug: teamSlug, type: meetingSlug } = paramsSchema.parse(context.params);
  const { rescheduleUid } = context.query;
  const { ssrInit } = await import("@server/lib/ssr");
  const ssr = await ssrInit(context);

  const team = await prisma.team.findFirst({
    where: {
      slug: teamSlug,
    },
    select: {
      id: true,
    },
  });

  if (!team) {
    return {
      notFound: true,
    };
  }

  let booking: GetBookingType | null = null;
  if (rescheduleUid) {
    booking = await getBookingByUidOrRescheduleUid(`${rescheduleUid}`);
  }
  await ssr.viewer.public.event.prefetch({ username: teamSlug, eventSlug: meetingSlug });
  return {
    props: {
      booking,
      away: false,
      user: teamSlug,
      slug: meetingSlug,
      trpcState: ssr.dehydrate(),
    },
  };
};
