import React, { useEffect, useRef, useState } from 'react';
import { send } from '../../websock';
import { echo } from '../../input.js';

export default function Help() {
  const inputRef = useRef(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Загружаем подсказки для справки (раньше было $.get('/help/typeahead.json', ...))
  useEffect(() => {
    let cancelled = false;
    fetch('/help/typeahead.json', { cache: 'no-cache' })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        // Приводим к удобному формату
        // dataItem: { id, n, l, t }
        const norm = Array.isArray(data)
          ? data.map(d => ({
              id: d.id,
              title: String(d.t || ''),
              // строка для поиска, как раньше dataItem.n.toLowerCase()
              needle: String(d.n || '').toLowerCase(),
            }))
          : [];
        setTopics(norm);
        setLoading(false);
        setLoadError(null);
        console.log('Retrieved', norm.length, 'help topics.');
      })
      .catch(e => {
        if (cancelled) return;
        console.log('Cannot retrieve help hints.');
        setTopics([]);
        setLoading(false);
        setLoadError(e || true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showTopic = topic => {
    const q = String(topic || '').trim();
    if (!q) return;
    const cmd = 'справка ' + q;
    echo(cmd + '\n');
    send(cmd);
    if (inputRef.current) inputRef.current.value = '';
    const mainInput = document.querySelector('#input input');
    if (mainInput) mainInput.focus();
  };

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    let suggestions = [];

    const removeSuggestions = () => {
      const old = document.getElementById('help-suggestions');
      if (old) old.remove();
    };

    const buildList = () => {
      removeSuggestions();
      const list = document.createElement('ul');
      list.id = 'help-suggestions';
      list.className = 'autocomplete-suggestions';
      inputEl.parentNode && inputEl.parentNode.appendChild(list);
      return list;
    };

    const handleInput = () => {
      const value = inputEl.value.trim().toLowerCase();
      suggestions = [];
      if (value && topics.length) {
        suggestions = topics
          .filter(
            t =>
              t.title.toLowerCase().includes(value) ||
              (t.needle && t.needle.includes(value))
          )
          .slice(0, 10);
      }
      if (!value) {
        removeSuggestions();
        return;
      }
      const list = buildList();
      if (suggestions.length) {
        suggestions.forEach((s, idx) => {
          const li = document.createElement('li');
          li.className = 'autocomplete-suggestion';
          li.textContent = s.title;
          if (idx === 0) li.setAttribute('data-first', 'true');
          li.addEventListener('click', () => {
            showTopic(s.id);
            removeSuggestions();
          });
          list.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.className = 'no-suggestion';
        li.textContent = 'Справка не найдена';
        list.appendChild(li);
      }
    };

    const handleKeyDown = e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const first = document.querySelector(
          '#help-suggestions .autocomplete-suggestion[data-first="true"]'
        );
        if (first && suggestions[0]) showTopic(suggestions[0].id);
        else showTopic(inputEl.value);
        removeSuggestions();
      } else if (e.key === 'Escape') {
        removeSuggestions();
      }
    };

    const handleBlur = () => {
      // задержка чтобы успел обработаться click по элементу списка
      setTimeout(removeSuggestions, 120);
    };

    if (loadError) {
      // Упрощённый режим: только Enter
      const onKeypress = e => {
        if (e.key === 'Enter') showTopic(inputEl.value);
      };
      inputEl.addEventListener('keypress', onKeypress);
      return () => {
        inputEl.removeEventListener('keypress', onKeypress);
      };
    } else {
      inputEl.addEventListener('input', handleInput);
      inputEl.addEventListener('keydown', handleKeyDown);
      inputEl.addEventListener('blur', handleBlur);
      return () => {
        inputEl.removeEventListener('input', handleInput);
        inputEl.removeEventListener('keydown', handleKeyDown);
        inputEl.removeEventListener('blur', handleBlur);
      };
    }
  }, [topics, loadError]);

  return (
    <div id="help" className="table-wrapper">
      <span
        className="dark-panel-title"
        data-bs-toggle="collapse"
        data-bs-target="#help-table"
      >
        Поиск по справке
      </span>
      <button
        className="close"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#help-table"
      >
        {' '}
      </button>
      <div id="help-table" className="" data-hint="hint-help">
        <span className="fa fa-search form-control-feedback"></span>
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="Введи ключевое слово"
          disabled={loading}
        />
        {/* Список подсказок (<ul id="help-suggestions">) создаётся динамически */}
      </div>
    </div>
  );
}
