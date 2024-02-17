export function styleTime(value) {
    if (value != null) {

        value = value.toString();

        if (value.length <= 1) {
            value = '0' + value;
        }
    }
    return value;
}