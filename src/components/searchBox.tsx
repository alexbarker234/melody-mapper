"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import styles from "./searchBox.module.scss";

interface SearchBoxProps {
    runSearch: (searchText: string) => void
    startValue?: string;
}

export default function SearchBox({ runSearch, startValue }: SearchBoxProps) {
    const [searchText, setSearchText] = useState(startValue ?? "");
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const toSearch = event.currentTarget.value;
        setSearchText(toSearch);
        if (typingTimeout) clearTimeout(typingTimeout);

        setTypingTimeout(
            setTimeout(() => {
                if (toSearch.replaceAll(" ", "").length < 3) return;
                runSearch(toSearch);
            }, 500)
        );
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && searchText.replaceAll(" ", "").length > 0) {
            runSearch(searchText);
            if (typingTimeout) clearTimeout(typingTimeout);
        }
    };

    useEffect(() => {
        if (startValue) runSearch(searchText);
    }, [])

    useEffect(() => {
        return () => {
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [typingTimeout]);

    return (
        <div className={styles["search"]}>
            <input type="text" value={searchText} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Search..." />
        </div>
    );
}