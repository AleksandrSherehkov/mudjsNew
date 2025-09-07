
import React, { useState, useEffect, useRef } from 'react';

import { send } from '../../websock';

const echo = txt => {
  const terminal = document.querySelector('.terminal');
  if (terminal) {
    terminal.dispatchEvent(new CustomEvent('output', { detail: [txt] }));
  }
};

const useTypeahead = () => {
  const [state, setState] = useState({
    loading: true,
    topics: [],
    error: null,
  });

  useEffect(() => {
    fetch('/help/typeahead.json')
      .then(response => response.json())
      .then(data => {
        // Success:
        console.log('Retrieved', data.length, 'help topics.');

        // Convert retrieved JSON to format accepted by autocomplete plugin.
        const topics = data.map(dataItem => ({
          value: dataItem.n.toLowerCase(),
          data: { link: dataItem.l, title: dataItem.t, id: dataItem.id },
        }));

        setState({ loading: false, topics, error: null });
      })
      .catch(e => {
        // Failure:
        console.log('Cannot retrieve help hints.');

        setState({ loading: false, topics: [], error: e });
      });
  }, []);

  return state;
};

export default function Help() {
  const ref = useRef();
  const { loading, topics, error } = useTypeahead();

  const showTopic = function (topic) {
    const inputbox = ref.current;
    var cmd = 'справка ' + topic;
    echo(cmd + '\n');
    send(cmd);
    if (inputbox) inputbox.value = '';
    const mainInput = document.querySelector('#input input');
    if (mainInput) mainInput.focus();
  };

  // TODO: use React autocomplete
  useEffect(() => {
    const inputbox = ref.current;
    if (!inputbox) return;

    if (error) {
      // Default to just invoke 'help topic' on Enter.
      const handleKeypress = function (e) {
        if (e.keyCode === 13) {
          showTopic(inputbox.value);
        }
      };
      inputbox.addEventListener('keypress', handleKeypress);
      return () => inputbox.removeEventListener('keypress', handleKeypress);
    } else {
      // Simplified autocomplete functionality
      const handleKeypress = function (e) {
        if (e.keyCode === 13) {
          const value = inputbox.value.toLowerCase();
          const match = topics.find(topic => 
            topic.value.includes(value) || topic.data.title.toLowerCase().includes(value)
          );
          if (match) {
            showTopic(match.data.id);
          } else {
            showTopic(value);
          }
        }
      };
      inputbox.addEventListener('keypress', handleKeypress);
      return () => inputbox.removeEventListener('keypress', handleKeypress);
    }
  }, [loading, topics, error]);

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
          ref={ref}
          type="text"
          className="form-control"
          placeholder="Введи ключевое слово"
          disabled={loading}
        />
      </div>
    </div>
  );
}
