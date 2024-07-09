import { useMediaQuery } from "react-responsive";

export function useIsMobileView() {
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    return { isMobile } as const;
}
