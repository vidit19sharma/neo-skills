{{#hero}}<p align="center">{{{hero_html}}}</p>

{{/hero}}{{#socials}}<p align="center">
{{{socials_html}}}
</p>

{{/socials}}{{#about}}<table><tr>
{{#ascii}}<td width="300" valign="top">{{{ascii_html}}}</td>
{{/ascii}}<td valign="top">
<h3>👾 About</h3>
<ul>
{{{about_html}}}
</ul>
</td>
</tr></table>

{{/about}}{{#cards}}<table><tr>
{{#neofetch}}<td valign="top">{{{neofetch_html}}}</td>
{{/neofetch}}{{#heatmap}}<td valign="top">{{{heatmap_html}}}</td>
{{/heatmap}}</tr></table>

{{/cards}}{{#projects}}<h3>🚀 Projects</h3>
<table>
{{{projects_html}}}
</table>

{{/projects}}{{#stack}}<h3>💻 Tech Stack</h3>
<p align="center"><a href="{{stack_href}}"><img src="https://skillicons.dev/icons?i={{stack_icons}}&perline={{stack_perline}}" alt="Tech stack: {{stack_list}}"></a></p>

{{/stack}}{{#stats}}<h3>📊 GitHub Stats</h3>
<table><tr>
{{{stats_html}}}
</tr></table>

{{/stats}}{{#snake}}<h3>🐍 Contribution snake</h3>
<p align="center">{{{snake_html}}}</p>

{{/snake}}{{#activity}}<h3>⚡ Recent activity</h3>
{{{activity_html}}}

{{/activity}}{{#footer}}<hr>
<p align="center"><sub>{{{footer_html}}}</sub></p>
{{/footer}}
