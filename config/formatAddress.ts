export const sliceAddress = (address: string, visibleLetters = 5) => {
    if (address.length < visibleLetters * 2 + 3) {
        return address;
    }

    return (
        address.slice(0, visibleLetters) +
        "..." +
        address.slice(address.length - visibleLetters, address.length)
    );
};
