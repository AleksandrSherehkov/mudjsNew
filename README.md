# MUDJS: Web-Socket MUD client
[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)
[![Build Status](https://travis-ci.org/dreamland-mud/mudjs.svg?branch=dreamland)](https://travis-ci.org/dreamland-mud/mudjs)

**Содержание**
* [Обзор](#overview)
* [Онлайн-разработка в gitpod.io](#gitpod)
* [Локальная разработка](#build)
    * [Сборка](#build)
    * [Запуск](#launch)
* [Описание протокола общения с сервером мира DreamLand](#proto)
   * [Web Prompt: расширенная строка состояния](#webprompt)
   * [Поддержка цветов](#color)
   * [Контекстное меню манипуляции с предметами](#manip)
   * [RPC-протокол](#rpc)
* [Использование клиента для других MUD-ов](#other)

## <a name="overview">Обзор</a>

Клиент mudjs первоначально был разработан для мира DreamLand и сейчас доступен по адресу
https://dreamland.rocks/mudjs. Для полноценного его использования в код DreamLand была добавлена
поддержка web sockets. Это дало возможность поддерживать SSL-соединения, а также видеть реальный
IP адрес тех, кто соединяется с миром.

Сейчас в репозитории есть две ветки:
* **master** - код клиента неспецифичен для какого-либо сервера и может быть использован для любого MUD
* **dreamland** - плотная интеграция с сервером DreamLand по собственному протоколу общения

Основная разработка ведется в ветке **dreamland**. Master по сути заморожен.

## <a name="gitpod">Разработка в gitpod.io</a>

[Gitpod](https://gitpod.io) предоставляет встроенную в браузер среду разработки на базе Visual Studio Code, а также полноценный контейнер со множеством установленных программ.

* **Запустить среду**: просто зайдите на https://gitpod.io/#https://github.com/dreamland-mud/mudjs  (вместо dreamland-mud/mudjs можно указать свой собственный fork). В созданном контейнере уже будет собран клиент и запущен веб-сервер на порту 8080. 
* **Открыть веб-клиент в браузере**: нажмите на "Ports: 8000" в синей строке состояния, а затем на кнопку "Open Browser".
* **Пересобрать веб-клиент**: в терминале нажмите Ctrl+C и стрелку вверх, чтобы перезапустить предыдущую команду

### Доступ к репозиторию из gitpod.io

Изнутри контейнера, который предоставляет gitpod.io, можно сделать `git pull` или `git fetch`, но нет прав для заливки своих изменений обратно в репозиторий, `git push`. Вот как можно добавить права контейнеру с помощью SSH-ключей:

* Внутри контейнера создайте новую пару ключей:
```bash
ssh-keygen -t rsa -b 4096 -C "ruffina.koza@gmail.com"
```
* В настройках Github для вашего пользователя (Settings -> SSH and GPG keys) добавьте публичный ключ `ssh_host_rsa_key.pub` с правами read/write
* Внутри контейнера убедитесь, что `origin` вашего репозитория смотрит на нужный форк, и поправьте по необходимости:
```bash
git remote set-url origin <git url>
```
* Внутри контейнера запустите `ssh-agent` и добавьте этот ключ:
```bash
eval $(ssh-agent)
ssh-add ~/.ssh/ssh_host_rsa_key
```
* Из этой же консоли, где запущен `ssh-agent`, теперь можно выполнять `git push`

## <a name="build">Локальная сборка</a>

Для сборки ветки dreamland, cклонируйте основной репозиторий или свой форк, например:
```bash
git clone https://github.com/dreamland-mud/mudjs.git
```
Затем установите NodeJs и npm, скачав последнюю рекомендуемую версию для вашей системы с [официального сайта NodeJs](https://nodejs.org/en/). Под Linux может понадобиться прописать путь к бинарникам node и npm в переменной окружения PATH. Это можно сделать с командной строки или же прописать в файле ~/.bashrc:
```bash
export NODEJS_HOME=/opt/node-v8.11.3-linux-x64 # путь может отличаться
export PATH=$NODEJS_HOME/bin:$PATH
```

После первой установки или после крупных изменений может понадобиться скачать все необходимые пакеты:
```bash
cd mudjs
npm install
```
И, наконец, сборка из исходников:
```bash
npm run build
```
## <a name="launch">Локальный запуск</a>

Запустите клиент в режиме разработчика: все изменения в исходных файлах будут подхватываться и пересобираться автоматически.
Клиент станет доступен по адресу http://localhost:3000/ и по умолчанию соединится с основным сервером Дримленд.
```bash
npm run start
```

Можно указать различные фрагменты после /#, для доступа к различным серверам:

* http://localhost:3000/ - соединится с основным сервером на dreamland.rocks
* http://localhost:3000/#buildplot - соединится со стройплощадкой на dreamland.rocks
* http://localhost:3000/#local - попытается соединиться с локально запущенным сервером на localhost 1234. Подробнее о том, как установить локальный сервер, смотрите в инструкции к проекту [dreamland_code](https://github.com/dreamland-mud/dreamland_code).

Если клиент запускается, но не удается соедениться с сервером, в первую очередь проверьте, не активирован ли AdBlock на текущей странице.

## <a name="proto">Описание протокола общения с сервером мира DreamLand</a>

Общение между сервером и клиентом происходит в виде команд с аргументами, передаваемых в формате JSON.
```json
{ "command": "имя команды", "args": ["первый аргумент", "второй аргумент", "и так далее"] }
```
Поддерживаемые команды:
* **console_out** *строка*: обычный вывод сообщения в терминал
* **notify** *строка*: вывод сообщения во всплывающем окошке оповещений
* **alert** *строка*: вывод сообщения через JavaScript alert в модальном окне
* **version** *строка*: сервер передает текующую версию, и если она не совпадает с версией клиента, соединиться не получится
* **editor_open**: открывает диалоговое окно с текстовым редактором (вышлется с сервера, если пользователь успешно выполнил команду webedit)
* **cs_edit**: открывает диалоговое окно с редактором скриптов на Fenia, с подсветкой синтаксиса (вышлется с сервера после выполнения команды codesource edit)
* **prompt** *массив аргументов*: т.н. web prompt высылается с сервера каждый раз одновременно с обычной строкой состояния. По результатам его обработки будет отрисована правая панель.

### <a name="rpc">RPC-протокол</a>

TODO

### <a name="webprompt">Web Prompt: расширенная строка состояния</a>

Расширенная строка состояния - это JSON-структура, содержащая поля для каждого из видов сообщений (эффекты, кто в мире, положение персонажа и т. д.). На основании этих полей будут заполнены окошки на правой панели клиента. Если между двумя последовательными выводами от сервера к клиенту какое-то из полей не изменилось, оно не будет включено в вывод, и клиент будет знать, что его перерисовывать не надо. Если какое-то поле исчезло (исчезла группа эффектов, стала не видна погода), его значение будет выслано как 'none', и клиент будет знать, что соответствующую секцию на правой панели надо спрятать.

Поля постоянно дорабатываются, но комментарии к каждой из функций в **prompt.js** должны содержать актуальные названия полей и расшифровку всех значений.

Пример строки состояния с подробными комментариями можно увидеть в [этой статье вики](https://github.com/dreamland-mud/mudjs/wiki/MUD-prompt).

### <a name="color">Поддержка цветов</a>
Веб-клиент умеет парсить ANSI-последовательности с цветами, кроме того, он распознает псевдотеги разметки, которые ему посылает
сервер DreamLand. Например,
```xml
<c c='fgbg'>ярко-зеленое сообщение</c>
```
превратится в
```html
<span class='fgbg'>ярко-зеленое сообщение</span>
```
Названия классов основаны на названиях цветов внутри мира, fgbg - (foreground) bright green, fgdr - dark red, и т. д. Они все объявлены в файле main.css.

### <a name="manip">Контекстное меню манипуляции с предметами</a>
Каждый предмет в инвентаре, экипировке, контейнере или на полу обрамляется специальным псевдотегом разметки <m>. Веб-клиент обрабатывает эти теги и превращает их в стандартное [dropdown-menu из Bootstrap](https://getbootstrap.com/docs/4.1/components/dropdowns/).

Пример разметки для предмета в инвентаре:
```xml
<m c='бросить $, надеть $, смотреть $, использовать $, легенды $' id='1773732900'>хитрость лаеркаи</m>
```
Для компактности символ $ будет заменен на стороне клиента на уникальный ID предмета. ID используется в качестве аргумента для однозначности при манипуляциях.

Пример разметки для команд с дополнительным аргументом. Здесь 5394478976633 - ID бочонка, найденного в инвентаре персонажа, который можно было бы наполнить из этого фонтана.
```xml
<m c='пить $, наполнить 5394478976633 $, смотреть $' id='1614907783901'>Большой фонтан (fountain) здесь, бьет нескончаемым потоком воды.</m>
```
Некоторые манипуляции контекстно-зависимы и могут быть проделаны только в какой-то комнате (магазине, у ремонтника). Такие команды отделяются в меню вертикальной чертой, а внутри псевдотега будут переданы аттрибутом 'l':
```xml
<m c='бросить $, надеть $, смотреть $, легенды $' l='чинить $, стоимость $' id='5573732900'>хитрость лаеркаи</m>
```

Подробнее о командах и тэгах веб-клиента можно почитать в [этой статье вики](https://github.com/dreamland-mud/mudjs/wiki/Tags-overview).

## <a name="other">Использование клиента для других MUD-ов</a>

Для использования master версии клиента в своем мире нужна либо поддержка web sockets, либо можно
воспользоваться утилитой websockify. Например, если мир обычно доступен по протоколу telnet на порту 9000,
на хостинге запустите:

websockify :4321 :9000

После чего в странице веб-клиента (например, /mudjs/index.html) установите переменную wsUrl,
указывающую на ваш хост и порт 4321:

        <script>
            var wsUrl = "ws://yourmud.com:4321";
        </script>

Хост "yourmud.com" должен совпадать с именем сайта, на котором размещен вебклиент.
Внутри main.js, первое что посылается при соединении с сервером, это цифра 7, что соответствует
выбору кодировки UTF8 в DreamLand. У себя вы можете изменить эту цифру на тот номер кодировки,
который соответствует UTF8 в вашем мире:

        ws.onopen = function(e) {
            send('7');
        }

Готово. Теперь при заходе на страницу http://yourmud.com/mudjs/index.html пройзойдет подключение
к серверу, и можно будет начинать играть.



