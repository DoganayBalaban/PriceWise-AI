import asyncio

from langgraph.graph import END, StateGraph

from app.agents.nodes import decision_node, price_analyst_node, review_rag_node
from app.agents.state import AgentState

_graph = None
_graph_lock = asyncio.Lock()


def _build_graph():
    builder: StateGraph = StateGraph(AgentState)
    builder.add_node("price_analyst_node", price_analyst_node)
    builder.add_node("review_rag_node", review_rag_node)
    builder.add_node("decision_node", decision_node)

    builder.set_entry_point("price_analyst_node")
    builder.add_edge("price_analyst_node", "review_rag_node")
    builder.add_edge("review_rag_node", "decision_node")
    builder.add_edge("decision_node", END)

    return builder.compile()


async def get_agent_graph():
    global _graph
    if _graph is not None:
        return _graph
    async with _graph_lock:
        if _graph is None:
            _graph = _build_graph()
    return _graph
