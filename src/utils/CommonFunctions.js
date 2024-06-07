const useValidatedInput = (initialValue) => {
        let nameRegex = /^[a-zA-Z\s\-']+$/;
        const cleanedValue = initialValue.replace(/^\s+|\s+$/g, '').replace(/\s\s+/g, ' ');
        if (nameRegex.test(cleanedValue)) {
            return cleanedValue;
        } else {
            return cleanedValue.replace(/[`~0-9!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        }
};

const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters from the input
    const digits = phoneNumber.replace(/\D/g, '');
  
    // Slice the string to match the desired format and add necessary characters
    const areaCode = digits.slice(0, 3);
    const middle = digits.slice(3, 6);
    const last = digits.slice(6, 10);
  
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${areaCode}) ${middle}`;
    if (digits.length > 10) return digits ;
    return `(${areaCode})-${middle}-${last}`;
};

const cleanPhoneNumber = (formattedNumber) => {
    return formattedNumber.replace(/[^\d]/g, '');
};


export { useValidatedInput, formatPhoneNumber, cleanPhoneNumber };