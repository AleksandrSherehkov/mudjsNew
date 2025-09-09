import React from 'react';
import PanelItem from './panelItem';
import {
  Cnames,
  Dnames,
  Enames,
  Pnames,
  Tnames,
  Mnames,
} from './windowletsConstants';

// prompt affect helper function: draw a block of affects
// prompt affect block fields: a - active bits, z - bits from affects with zero duration
function AffectBlock(props) {
  const clr_active = 'fg-ansi-bright-color-' + props.color;
  const clr_zero = 'fg-ansi-bright-color-3';
  const clr_header = 'fg-ansi-bright-color-7';

  let rows = [];
  for (let bit in props.bitNames) {
    if (Object.prototype.hasOwnProperty.call(props.bitNames, bit)) {
      let clr;

      // Draw active affect names in green, those about to
      // disappear in yellow.
      if (props.block.z.indexOf(bit) !== -1) clr = clr_zero;
      else if (props.block.a.indexOf(bit) !== -1) clr = clr_active;
      else continue;

      rows.push(
        <span key={bit} className={clr}>
          {props.bitNames[bit]}
        </span>
      );
    }
  }

  return (
    <div
      id={'pa-' + props.type}
      className="flexcontainer-column"
      data-hint={'hint-' + props.type}
    >
      <span className={clr_header}>{props.blockName}</span>
      {rows}
    </div>
  );
}

export default function AffectsItem(props) {
  return (
    <PanelItem title="Воздействия на тебе">
      <div
        id="player-affects-table"
        className="flexcontainer-row flexcontainer-wrap "
        data-hint="hint-affects"
      >
        {props.pro && props.pro !== 'none' && (
          <AffectBlock
            block={props.pro}
            blockName="Защита"
            bitNames={Pnames}
            color="2"
            type="protect"
          />
        )}
        {props.det && props.det !== 'none' && (
          <AffectBlock
            block={props.det}
            blockName="Обнар"
            bitNames={Dnames}
            color="2"
            type="detects"
          />
        )}
        {props.trv && props.trv !== 'none' && (
          <AffectBlock
            block={props.trv}
            blockName="Трансп"
            bitNames={Tnames}
            color="2"
            type="travel"
          />
        )}
        {props.enh && props.enh !== 'none' && (
          <AffectBlock
            block={props.enh}
            blockName="Усилен"
            bitNames={Enames}
            color="2"
            type="enhance"
          />
        )}
        {props.mal && props.mal !== 'none' && (
          <AffectBlock
            block={props.mal}
            blockName="Отриц"
            bitNames={Mnames}
            color="1"
            type="malad"
          />
        )}
        {props.cln && props.cln !== 'none' && (
          <AffectBlock
            block={props.cln}
            blockName="Клан"
            bitNames={Cnames}
            color="2"
            type="clan"
          />
        )}
      </div>
    </PanelItem>
  );
}
