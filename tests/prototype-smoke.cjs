"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const events = {};
const root = {
  innerHTML: "",
  listeners: {},
  addEventListener(kind, callback) { this.listeners[kind] = callback; },
  querySelector() { return null; },
  appendChild() {}
};
const location = { hash: "#dashboard" };
const document = {
  getElementById(id) { return id === "app" ? root : null; },
  createElement() { return { className: "", textContent: "", isConnected: false, remove() {} }; }
};
const store = new Map();
const context = {
  document, location, console, Date, Math, Number, JSON, String, URL,
  localStorage: {
    getItem(k) { return store.get(k) || null; },
    setItem(k,v) { store.set(k, v); }
  },
  window: {
    addEventListener(kind, cb) { events[kind] = cb; }
  },
  setTimeout() {},
  confirm() { return true; }
};
vm.runInNewContext(fs.readFileSync("prototype.js","utf8"), context, {
  filename: "prototype.js",
  timeout: 5000
});
assert.match(root.innerHTML, /Пульс компании/);
assert.match(root.innerHTML, /Плановая экономика/);
assert.match(root.innerHTML, /ИНТЕРАКТИВНЫЙ МАКЕТ/);
assert.match(root.innerHTML, /Учебная компания/);

root.listeners.change({ target: { id: "role-select", value: "operator" } });
assert.match(root.innerHTML, /Мой рабочий день/);
assert.doesNotMatch(root.innerHTML, /Плановая экономика/);

location.hash = "#projects"; events.hashchange();
assert.match(root.innerHTML, /Тендерный портфель/);
assert.match(root.innerHTML, /DEMO-2026-0124/);

location.hash = "#project:TB-000124"; events.hashchange();
assert.match(root.innerHTML, /КАРТОЧКА ПРОЕКТА/);
assert.match(root.innerHTML, /Обогащение|обогащение/);
assert.match(root.innerHTML, /Ключевые требования/);

location.hash = "#graph"; events.hashchange();
assert.match(root.innerHTML, /Граф знаний/);
assert.match(root.innerHTML, /graph-svg/);
assert.match(root.innerHTML, /graphnode/);

location.hash = "#audit"; events.hashchange();
assert.match(root.innerHTML, /Журнал событий/);

location.hash = "#sources"; events.hashchange();
assert.match(root.innerHTML, /Не вводите здесь реальный API-токен/);
assert.doesNotMatch(root.innerHTML, /name="api_token"/);
console.log("tenderBOLT public prototype smoke: manager/operator, projects, graph, audit, safe sources OK");
