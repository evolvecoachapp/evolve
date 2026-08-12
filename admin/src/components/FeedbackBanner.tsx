type FeedbackBannerProps = {
  tone: "success" | "error";
  children: string;
};

export function FeedbackBanner({ tone, children }: FeedbackBannerProps) {
  return (
    <div
      className={`banner banner-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
