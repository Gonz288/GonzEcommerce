let count = 1;
const quantityElement = document.getElementById('quantity');
const quantityInput = document.getElementById("quantityInput");

function sumar() {
    count++;
    quantityInput.value = count;
    quantityElement.textContent = count;
}

function restar() {
    if(count > 1){
        count--;
        quantityInput.value = count;
        quantityElement.textContent = count;
    }
}