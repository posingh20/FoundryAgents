import { withCustomSpan } from '@openai/agents';
import {
  createPlannerAgentConfig,
  webSearchPlan,
  createSearchAgentConfig,
  createWriterAgentConfig,
  reportData,
  WebSearchPlan,
  WebSearchItem,
  ReportData,
} from './researchAgentHelpers';
import { runAgent, runAgentWithStructuredOutput } from '../agent';

export class ResearchManager {
  constructor() {}

  async run(query: string): Promise<void> {
    console.log(`[starting] Starting research...`);
    const searchPlan = await this._planSearches(query);
    const searchResults = await this._performSearches(searchPlan);
    const report = await this._writeReport(query, searchResults);

    const finalReport = `Report summary\n\n${report.shortSummary}`;
    console.log(`[final_report] ${finalReport}`);
    console.log('Research complete.');

    console.log('\n\n=====REPORT=====\n\n');
    console.log(`Report: ${report.markdownReport}`);
    console.log('\n\n=====FOLLOW UP QUESTIONS=====\n\n');
    const followUpQuestions = report.followUpQuestions.join('\n');
    console.log(`Follow up questions: ${followUpQuestions}`);
  }

  async _planSearches(query: string): Promise<WebSearchPlan> {
    console.log('[planning] Planning searches...');
    const plannerConfig = createPlannerAgentConfig();
    const result = await runAgentWithStructuredOutput(plannerConfig, `Query: ${query}`);
    const parsed = webSearchPlan.parse(result);
    console.log(`[planning] Will perform ${parsed.searches.length} searches`);
    return parsed;
  }

  async _performSearches(searchPlan: WebSearchPlan): Promise<string[]> {
    console.log('[searching] Searching...');
    let numCompleted = 0;
    const tasks = searchPlan.searches.map((item: WebSearchItem) =>
      this._search(item),
    );
    const results: string[] = [];
    for await (const result of tasks) {
      if (result != null) results.push(result);
      numCompleted++;
      console.log(
        `[searching] Searching... ${numCompleted}/${tasks.length} completed`,
      );
    }
    console.log('[searching] done');
    return results;
  }

  async _search(item: WebSearchItem): Promise<string | null> {
    const input = `Search term: ${item.query}\nReason for searching: ${item.reason}`;
    try {
      const searchConfig = createSearchAgentConfig();
      const result = await runAgent(searchConfig, input);
      // Extract just the response content, removing the "Building agent" prefix
      const cleanResult = result.replace(/^Building agent - Agent execution completed!\n\nTask:.*?\nResponse: /, '');
      return cleanResult;
    } catch {
      return null;
    }
  }

  async _writeReport(
    query: string,
    searchResults: string[],
  ): Promise<ReportData> {
    console.log('[writing] Thinking about report...');
    const input = `Original query: ${query}\nSummarized search results: ${searchResults.join('\n\n')}`;
    const writerConfig = createWriterAgentConfig();
    const result = await runAgentWithStructuredOutput(writerConfig, input);
    console.log('[writing] done');
    return reportData.parse(result);
  }
}