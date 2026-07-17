import Link from "next/link";
import { formatPacificHour } from "@/lib/time/pacific";
import { slugForCategoryLabel, withCategoryParam } from "@/lib/whatnot/category-slug";
import { Card } from "./ui";

export function DoThisNext({
  platform,
  hotCategory,
  peakHour,
}: {
  platform: string;
  hotCategory: string | null;
  peakHour: number | null;
}) {
  if (!hotCategory && peakHour == null) return null;

  const catSlug = hotCategory ? slugForCategoryLabel(hotCategory) : null;
  const whatsSellingHref = catSlug
    ? withCategoryParam(`/${platform}/whats-selling`, catSlug)
    : `/${platform}/whats-selling`;

  return (
    <Card title="Do this next">
      <div className="px-4 py-4 text-sm text-ink">
        <p className="leading-relaxed">
          {hotCategory && (
            <>
              Source into{" "}
              <Link
                href={whatsSellingHref}
                className="font-semibold text-signal hover:underline"
              >
                {hotCategory}
              </Link>
            </>
          )}
          {hotCategory && peakHour != null && " · "}
          {peakHour != null && (
            <>
              Go live around{" "}
              <Link
                href={`/${platform}/best-time`}
                className="font-semibold text-signal hover:underline"
              >
                {formatPacificHour(peakHour)}
              </Link>
            </>
          )}
          {" · "}
          <Link
            href={whatsSellingHref}
            className="font-semibold text-signal hover:underline"
          >
            See what&apos;s selling →
          </Link>
        </p>
      </div>
    </Card>
  );
}
