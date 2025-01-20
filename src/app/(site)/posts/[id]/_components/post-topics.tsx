import Link from "next/link"
import { getPost } from "../../../actions"

interface Props {
    postId: string
}

export async function PostTopics({ postId }: Props) {
    const postData = await getPost(postId)
    if (!postData?.post) return null

    const { post } = postData

    return (
        <div className="space-y-4">
            <h3 className="font-medium">所属主题</h3>
            <ul className="space-y-2">
                {post.postTrees.map((tree) => (
                    <li key={tree.topic.id}>
                        <Link
                            href={`/topics/${tree.topic.id}`}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            <div className="p-3 rounded-lg border hover:border-primary transition-colors">
                                <div className="font-medium text-foreground">{tree.topic.title}</div>
                                <div className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                                    {tree.topic.description}
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
} 