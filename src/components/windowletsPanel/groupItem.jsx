import React from 'react'
import PanelItem from './panelItem'


// prompt 'group' fields: ln - leader name in genitive case,
// leader - leader stats to display as a first line,
// pc - list of all remaining PCs, npc - all NPCs in the group.
// Each line format: sees - name, level, health - hitpoints percentage, hit_clr - color to display health with
// tnl - exp to next level.
const TeamMate = (stats) => {
     return (
        <tr>
            <td>{stats.sees}</td>
            <td>{stats.level}</td>
            <td className={"fg-ansi-bright-color-" + stats.hit_clr}>{stats.health + "%"}</td>
            <td>{stats.tnl}</td>
        </tr>
    )
}

export default function GroupItem(props) {

    return <PanelItem title={'Группа ' + props.group.ln} collapsed={true} >
            <div id="group-table">
                <table>
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Ур.</th>
                            <th>Здор.</th>
                            <th>Опыт</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.group.leader && <TeamMate {...props.group.leader}/>}
                        {props.group.pc && props.group.pc.map((stats, i) => {
                            return (
                                <TeamMate key={i} {...stats} />
                            )
                        })}
                        {props.group.npc && props.group.npc.map((stats, i) => {
                            return (
                                <TeamMate key={i} {...stats} />
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </PanelItem>
}


