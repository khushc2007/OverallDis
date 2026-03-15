import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { buttonVariants } from "./ui/button";
import { socialLinks } from "@/lib/constants";
import Link from "next/link";

export const Footer = () => {
  return (
    <div className="flex gap-6 items-center absolute bottom-4 md:bottom-[calc(var(--inset)+1.5rem)] left-1/2 -translate-x-1/2 whitespace-nowrap">
      <span className="text-sm text-foreground/60">Developed by Khush</span>
      <Link target="_blank" className={buttonVariants({ size: "icon-xl" })} href={socialLinks.github}>
        <GitHubLogoIcon className="size-6" />
      </Link>
    </div>
  );
};
