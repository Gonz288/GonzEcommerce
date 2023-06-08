let count = 1;
const quantityElement = document.getElementById('quantity');
const quantityInput = document.getElementById("quantityInput");

function add() {
    count++;
    quantityInput.value = count;
    quantityElement.textContent = count;
}

function subtract() {
    if(count > 1){
        count--;
        quantityInput.value = count;
        quantityElement.textContent = count;
    }
}