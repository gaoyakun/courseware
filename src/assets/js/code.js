window.Code = (function(c) {
c.bubble_sort =
`void bubbleSort (int numbers[], int count) {
    for (int i = count - 1; i >= 0; i--)
        for (int j = 0; j < i; j++) {
            if (numbers[j] > numbers[j+1]) {
                int tmp = numbers[j];
                numbers[j] = numbers[j+1];
                numbers[j+1] = tmp;
            }
        }
}`;
return c;
})(window.Code||{});