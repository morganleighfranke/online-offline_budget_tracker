let db;
//creates new database request for the budget database
const request = window.indexedDB.open("budget", 3);

request.onupgradeneeded = ({ event }) => {
  db = event.consoletarget.result;

  if (db.objectStoreNames.length === 0)
{
    db.createObjectStore("budgetStore", { autoIncrement: true });
}
};

request.onsuccess = (event) => {
  db = event.target.result;

  if (navigator.onLine) {
      checkDB();
  }
};

request.onerror = (event) => {
    console.log(event.target.error);
};

function saveRecord(event) {
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const listStore = transaction.objectStore("budgetStore");
    listStore.add(event);
}

function checkDB() {
    let transaction = db.transaction(["budgetStore"], "readwrite");
    const store = transaction.objectStore("budgetStore");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then ((response) => response.json())
            .then((data) => {
                if (data.length !==0) {
                    transaction = db.transaction(["budgetStore"], "readwrite");
                    const store = transcation.objectStore("budgetStore");
                    store.clear();
                }
            });
        }
    };
}

//wait to come back online
window.addEventListener("online", checkDB);