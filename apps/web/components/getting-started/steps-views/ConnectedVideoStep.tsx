import { ArrowRightIcon } from "@heroicons/react/solid";

import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { List } from "@calcom/ui";

import { AppConnectionItem } from "../components/AppConnectionItem";
import { StepConnectionLoader } from "../components/StepConnectionLoader";

interface ConnectedAppStepProps {
  nextStep: () => void;
}

const ConnectedVideoStep = (props: ConnectedAppStepProps) => {
  const { nextStep } = props;
  const { data: queryConnectedVideoApps, isLoading } = trpc.viewer.integrations.useQuery({
    variant: "conferencing",
    onlyInstalled: false,
  });
  const { t } = useLocale();

  const hasAnyInstalledVideoApps = queryConnectedVideoApps?.items.some(
    (item) => item.credentialIds.length > 0
  );

  return (
    <>
      {!isLoading && (
        <List className="bg-default  border-subtle divide-subtle scroll-bar mx-1 max-h-[45vh] divide-y !overflow-y-scroll rounded-md border p-0 sm:mx-0">
          {queryConnectedVideoApps?.items &&
            queryConnectedVideoApps?.items.map((item) => {
              if (item.slug === "daily-video") return null; // we dont want to show daily here as it is installed by default
              return (
                <li key={item.name}>
                  {item.name && item.logo && (
                    <AppConnectionItem
                      type={item.type}
                      title={item.name}
                      description={item.description}
                      logo={item.logo}
                      installed={item.credentialIds.length > 0}
                    />
                  )}
                </li>
              );
            })}
        </List>
      )}

      {isLoading && <StepConnectionLoader />}
      <button
        type="button"
        data-testid="save-video-button"
        className={classNames(
          "text-inverted mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-sm",
          !hasAnyInstalledVideoApps ? "cursor-not-allowed opacity-20" : ""
        )}
        disabled={!hasAnyInstalledVideoApps}
        onClick={() => nextStep()}>
        {t("next_step_text")}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </button>
    </>
  );
};

export { ConnectedVideoStep };
